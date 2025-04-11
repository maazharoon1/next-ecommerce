import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

export type Address = {
  phone: number;
  _key: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  clerkUserId: string;
  addresses: Address[];
};

export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  try {
    const query = groq`*[_type == "user" && clerkUserId == $clerkUserId][0]{
      _id,
      name,
      email,
      clerkUserId,
      "addresses": addresses[]
    }`;
    
    const user = await client.fetch<User | null>(query, { clerkUserId }, { cache: 'no-store' });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
} 