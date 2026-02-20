export function log(
  userId: string | null,
  action: string,
  status: "success" | "error",
  details?: any
) {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({
      timestamp,
      userId,
      action,
      status,
      details,
    })
  );
}
