import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { profiles, returns, events } from "../../../db/schema";
import { eq, and, or } from "drizzle-orm";
export const dynamic = "force-dynamic";
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
export async function GET(){
 const user=await getChatGPTUser(); if(!user)return fail("Please sign in to continue.",401);
 const db=getDb();const [profile]=await db.select().from(profiles).where(eq(profiles.id,user.userId));
 const merchants=await db.select({id:profiles.id,business:profiles.business,name:profiles.name}).from(profiles).where(eq(profiles.role,"merchant"));
 if(!profile)return NextResponse.json({profile:null,returns:[],merchants,email:user.email});
 const rows=await db.select().from(returns).where(profile.role==="customer"?eq(returns.customerId,user.userId):profile.role==="merchant"?eq(returns.merchantId,user.userId):or(eq(returns.driverId,user.userId),eq(returns.status,"requested")));
 const data=await Promise.all(rows.map(async r=>{
  const [customer]=await db.select().from(profiles).where(eq(profiles.id,r.customerId));
  const allowed=profile.role==="customer"||r.driverId===user.userId;
  return {...r,orderNumber:profile.role==="driver"&&!allowed?"":r.orderNumber,notes:allowed?r.notes:"",zip:customer?.zip,pickup:allowed?{name:customer?.name,address:customer?.address,phone:customer?.phone}:null};
 }));return NextResponse.json({profile,returns:data,merchants,email:user.email});
}
export async function POST(request:Request){
 const origin=request.headers.get("origin"); if(origin&&origin!==new URL(request.url).origin)return fail("Request origin is not allowed.",403);
 const user=await getChatGPTUser();if(!user)return fail("Please sign in to continue.",401);
 let b:any;try{b=await request.json()}catch{return fail("Invalid request.")}
 const db=getDb();const [profile]=await db.select().from(profiles).where(eq(profiles.id,user.userId));
 const clean=(v:any,max=300)=>typeof v==="string"?v.trim().slice(0,max):"";
 if(b.action==="profile"){
  const role=profile?.role||b.role;if(!["customer","driver","merchant"].includes(role))return fail("Choose a valid account type.");
  const fields={role,name:clean(b.name,100),phone:clean(b.phone,30),address:clean(b.address),zip:clean(b.zip,5),business:clean(b.business,120)};
  if(!fields.name||!fields.phone||!fields.address||!/^\d{5}$/.test(fields.zip)||(role==="merchant"&&!fields.business))return fail("Complete your name, phone, address and five-digit ZIP code.");
  await db.insert(profiles).values({id:user.userId,email:user.email,...fields,createdAt:new Date().toISOString()}).onConflictDoUpdate({target:profiles.id,set:fields});return NextResponse.json({ok:true});
 }
 if(!profile)return fail("Create your profile first.");
 if(b.action==="request"){
  if(profile.role!=="customer")return fail("Customer accounts can request pickups.",403);
  if(b.prepared!=="on"&&b.prepared!==true)return fail("Confirm that your return is approved, packed and labeled.");
  const carrier=clean(b.carrier),pickupDate=clean(b.pickupDate,10),window=clean(b.window);
  if(!["UPS","FedEx","USPS"].includes(carrier)||!["9am – 12pm","12pm – 3pm","3pm – 6pm"].includes(window)||!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)||!Number.isFinite(Date.parse(pickupDate+"T12:00:00Z"))||new Date(pickupDate+"T12:00:00Z").toISOString().slice(0,10)!==pickupDate||pickupDate<new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"}))return fail("Choose a carrier and a future pickup date and time.");
  const merchantId=clean(b.merchantId)||null;
  if(merchantId){const [m]=await db.select().from(profiles).where(and(eq(profiles.id,merchantId),eq(profiles.role,"merchant")));if(!m)return fail("Select a registered merchant.")}
  const item=clean(b.item,200),merchantName=clean(b.merchantName,120),orderNumber=clean(b.orderNumber,100);if(!item||!merchantName||!orderNumber)return fail("Add merchant, item and order number.");
  const id=crypto.randomUUID(),now=new Date().toISOString();
  await db.batch([db.insert(returns).values({id,customerId:user.userId,merchantId,merchantName,item,orderNumber,carrier,pickupDate,window,notes:clean(b.notes,1000),createdAt:now}),db.insert(events).values({id:crypto.randomUUID(),returnId:id,actorId:user.userId,status:"requested",createdAt:now})]);return NextResponse.json({ok:true,id});
 }
 const id=clean(b.id),[r]=await db.select().from(returns).where(eq(returns.id,id));if(!r)return fail("Return not found.",404);
 let next="",condition;
 if(b.action==="claim"&&profile.role==="driver"&&r.status==="requested"){next="assigned";condition=and(eq(returns.id,id),eq(returns.status,"requested"));}
 else if(b.action==="status"&&profile.role==="driver"&&r.driverId===user.userId){next=r.status==="assigned"?"picked_up":r.status==="picked_up"?"dropped_off":"";condition=and(eq(returns.id,id),eq(returns.status,r.status),eq(returns.driverId,user.userId));}
 else if(b.action==="receive"&&profile.role==="merchant"&&r.merchantId===user.userId&&r.status==="dropped_off"){next="received";condition=and(eq(returns.id,id),eq(returns.status,"dropped_off"),eq(returns.merchantId,user.userId));}
 else if(b.action==="cancel"&&profile.role==="customer"&&r.customerId===user.userId&&r.status==="requested"){next="cancelled";condition=and(eq(returns.id,id),eq(returns.status,"requested"),eq(returns.customerId,user.userId));}
 if(!next||!condition)return fail("This action is unavailable for your account or this return.",403);
 const updated=await db.update(returns).set({status:next,...(b.action==="claim"?{driverId:user.userId}:{})}).where(condition).returning({id:returns.id});if(!updated.length)return fail("This pickup changed. Refresh and try again.",409);
 await db.insert(events).values({id:crypto.randomUUID(),returnId:id,actorId:user.userId,status:next,createdAt:new Date().toISOString()});return NextResponse.json({ok:true});
}
