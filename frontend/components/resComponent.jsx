export default function resDiv({resData}){
    return(
        <>
            <div className=" absolute top-10 right-20 h-[200px] w-[600px] p-2 rounded-lg transform">
                <p>{resData}</p>
            </div>
        </>
    )
}