import AdminAccessClient from "./admin-access-client";

export const getWhitelist = () => {
  const raw =
    process.env.WHITE_LIST ??
    process.env.NEXT_PUBLIC_WHITE_LIST ??
    "";

  return raw;
};

export default function AdminAccessPage() {
  const whitelist = getWhitelist();
  return <AdminAccessClient whitelist={whitelist} />;
}
