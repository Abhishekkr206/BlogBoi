import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    reducerPath:"api",
    baseQuery:fetchBaseQuery({
        baseUrl:"http://localhost:5500/auth",
        credentials:"include",
    }),
    tagTypes:["Auth", "User", "Post", "Comment"],
    endpoints: ()=>({}),
})