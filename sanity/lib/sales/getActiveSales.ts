"use server"

import { client } from "../client";
import { groq } from "next-sanity";

export interface Sale {
  _id: string;
  title: string;
  description?: string;
  discountAmount: number;
  couponCode: string;
  validFrom: string;
  ValidUntil: string;
  isActive: boolean;
}

export async function getActiveSales(): Promise<Sale[]> {
  const now = new Date().toISOString();
  
  try {
    const  IS_ACTIVE_QUERY = groq`*[_type == "sales" && isActive == true && validFrom <= $now && ValidUntil >= $now] {
      _id,
      title,
      description,
      discountAmount,
      couponCode,
      validFrom,
      ValidUntil,
      isActive
    }`;
    
    const sales = await client.fetch<Sale[]>(IS_ACTIVE_QUERY, { now });
    return sales;
  } catch (error) {
    console.error("Error fetching active sales:", error);
    return [];
  }
}

export async function validateCouponCode(code: string): Promise<Sale | null> {
  const now = new Date().toISOString();
  
  try {
    const IS_VALIDATE_QUERY = groq`*[_type == "sales" && isActive == true && couponCode == $code && validFrom <= $now && ValidUntil >= $now][0] {
      _id,
      title,
      description,
      discountAmount,
      couponCode,
      validFrom,
      ValidUntil,
      isActive
    }`;
    
    const sale = await client.fetch<Sale | null>(IS_VALIDATE_QUERY, { code, now });
    return sale;
  } catch (error) {
    console.error("Error validating coupon code:", error);
    return null;
  }
} 