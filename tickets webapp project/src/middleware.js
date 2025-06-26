import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "3d5ca840-c213-4a06-aa9e-0c132fd49b24");
  requestHeaders.set("x-createxyz-project-group-id", "8cdd7900-ff18-4186-b368-3b9409964ec1");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}