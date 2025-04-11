import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, clerkUserId, address } = body;
    
    if (!name || !email || !clerkUserId || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = createClient({
      apiVersion,
      dataset,
      projectId,
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    });

    // Check if user already exists with this clerk ID
    const existingUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId }
    );

    if (existingUser) {
      // Update existing user
      const updatedUser = await client
        .patch(existingUser._id)
        .set({
          name,
          email,
          addresses: existingUser.addresses 
            ? [...existingUser.addresses, { ...address, _key: crypto.randomUUID() }]
            : [{ ...address, _key: crypto.randomUUID() }]
        })
        .commit();

      return NextResponse.json({ success: true, user: updatedUser });
    }
    
    // Create new user
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const user = await client.create({
      _type: "user",
      name,
      email,
      clerkUserId,
      slug: {
        current: slug,
        _type: "slug"
      },
      addresses: [{ 
        ...address, 
        _key: crypto.randomUUID() 
      }]
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to save user information" },
      { status: 500 }
    );
  }
} 