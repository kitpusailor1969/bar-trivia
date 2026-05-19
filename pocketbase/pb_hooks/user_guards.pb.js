// Enforce user creation rules that PocketBase's rule language can't express:
// - If no admin exists: anyone may create an admin (first-time setup)
// - If an admin exists: only an authenticated admin may create any user
onRecordBeforeCreateRequest((e) => {
  const info = $apis.requestInfo(e.httpContext)
  const auth = info.authRecord

  const adminRecords = $app.dao().findRecordsByFilter("users", "role = 'admin'", "", 1, 0)
  const adminExists = adminRecords.length > 0

  if (adminExists) {
    if (!auth || auth.getString("role") !== "admin") {
      throw new ForbiddenError("Only admins can create user accounts")
    }
  } else {
    // No admin yet — only allow creating the first admin account
    if (e.record.getString("role") !== "admin") {
      throw new BadRequestError("First account must be an admin")
    }
  }
}, "users")
