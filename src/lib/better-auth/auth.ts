import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "./db";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../env";
import { createAuthMiddleware } from "better-auth/api";
import db from "../database/db";
import { Subscription } from "../database/schema/subscription.model";
import { ObjectId } from "mongodb";

const dbClient = client.db();

 
export const auth = betterAuth({
    database: mongodbAdapter(dbClient),

     socialProviders: {
        google: { 
            clientId: GOOGLE_CLIENT_ID as string, 
            clientSecret: GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
     
     hooks: {
        after: createAuthMiddleware(async (ctx) => {
            const newSession = ctx.context.newSession;
            const user = newSession?.user;
          
            if (newSession && user) {
                try {
                    await db()
                    const isSubAvail = await Subscription.findOne({ subscriber: user.id });

                    if (isSubAvail) {
                        return;
                    }
                    const subs = await Subscription.create({
                        subscriber: user.id,
                        status:"activated"
                        
                    })

                    const userCollection = dbClient.collection("user");

                    await userCollection.updateOne({
                        _id: new ObjectId(subs.subscriber)
                    }, {
                      $set:{
                        subscription:subs._id
                      }  
                    }
                    )
                        
                } catch (error) {
                    console.log("error in creating subsciption before hook",error)
                    throw ctx.redirect("/")
 
                }
                
            }
        }),
    },

    plugins: [nextCookies()] 
})