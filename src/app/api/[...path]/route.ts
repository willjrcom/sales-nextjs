import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join("/");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${baseUrl}/${path}${req.nextUrl.search}`;

    try {
        const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

        const response = await fetch(url, {
            method: req.method,
            headers: req.headers,
            body: body,
            // @ts-ignore
            duplex: "half",
        });

        const data = await response.blob();

        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (error) {
        return NextResponse.json({ error: "Proxy Error" }, { status: 500 });
    }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH };
