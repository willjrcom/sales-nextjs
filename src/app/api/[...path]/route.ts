import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join("/");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
        return NextResponse.json({ error: "API base URL not configured" }, { status: 500 });
    }

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
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Proxy Error", details: String(error) }, { status: 500 });
    }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH };
