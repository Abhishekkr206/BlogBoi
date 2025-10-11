import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    reducerPath:"api",
    baseQuery:fetchBaseQuery({
        baseUrl:"http://localhost:5500",
        credentials:"include",
    }),
    tagTypes:["User", "Post", "Comment", "Follow"],
    endpoints: ()=>({}),
})