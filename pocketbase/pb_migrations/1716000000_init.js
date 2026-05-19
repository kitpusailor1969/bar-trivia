/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)

  // ----- users (modify the default auth collection PocketBase creates) -----
  const users = dao.findCollectionByNameOrId("users")
  users.options.allowUsernameAuth = true
  users.options.allowEmailAuth = false
  users.options.requireEmail = false
  users.options.minPasswordLength = 6
  users.createRule = null
  users.listRule = "@request.auth.role = 'admin'"
  users.viewRule = "@request.auth.role = 'admin'"
  users.updateRule = "@request.auth.role = 'admin'"
  users.deleteRule = null

  const existingNames = users.schema.fields().map(f => f.name)
  if (!existingNames.includes("display_name")) {
    users.schema.addField(new SchemaField({ name: "display_name", type: "text" }))
  }
  if (!existingNames.includes("role")) {
    users.schema.addField(new SchemaField({
      name: "role",
      type: "select",
      options: { maxSelect: 1, values: ["admin", "gm"] },
    }))
  }
  if (!existingNames.includes("is_active")) {
    users.schema.addField(new SchemaField({ name: "is_active", type: "bool" }))
  }
  dao.saveCollection(users)

  // ----- categories -----
  const categories = new Collection({
    name: "categories",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "color", type: "text" },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.role = 'admin'",
  })
  dao.saveCollection(categories)

  // Get categories collection ID for use in questions relation
  const categoriesCol = dao.findCollectionByNameOrId("categories")

  // ----- questions -----
  const questions = new Collection({
    name: "questions",
    type: "base",
    schema: [
      { name: "question_text", type: "text", required: true },
      { name: "answer", type: "text", required: true },
      {
        name: "category_id",
        type: "relation",
        options: { collectionId: categoriesCol.id, maxSelect: 1, cascadeDelete: false },
      },
      {
        name: "difficulty",
        type: "select",
        options: { maxSelect: 1, values: ["easy", "medium", "hard"] },
      },
      {
        name: "source",
        type: "select",
        options: { maxSelect: 1, values: ["manual", "otdb", "ai"] },
      },
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
  })
  dao.saveCollection(questions)

  // ----- games -----
  const games = new Collection({
    name: "games",
    type: "base",
    schema: [
      { name: "game_code", type: "text", required: true },
      {
        name: "status",
        type: "select",
        options: { maxSelect: 1, values: ["lobby", "active", "round_end", "finished"] },
      },
      { name: "gm_name", type: "text" },
      { name: "created_by", type: "text" },
      { name: "current_round", type: "number", options: { min: 0 } },
      { name: "current_question_index", type: "number", options: { min: 0 } },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.role = 'admin'",
  })
  dao.saveCollection(games)

  // ----- teams -----
  const teams = new Collection({
    name: "teams",
    type: "base",
    schema: [
      { name: "game_id", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "members", type: "json" },
      { name: "score", type: "number", options: { min: 0 } },
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "@request.auth.id != ''",
  })
  dao.saveCollection(teams)

  // ----- rounds -----
  const rounds = new Collection({
    name: "rounds",
    type: "base",
    schema: [
      { name: "game_id", type: "text", required: true },
      { name: "name", type: "text" },
      { name: "category_id", type: "text" },
      { name: "question_ids", type: "json" },
      {
        name: "status",
        type: "select",
        options: { maxSelect: 1, values: ["pending", "active", "completed"] },
      },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
  })
  dao.saveCollection(rounds)

  // ----- advertisements -----
  const ads = new Collection({
    name: "advertisements",
    type: "base",
    schema: [
      { name: "title", type: "text" },
      {
        name: "image",
        type: "file",
        options: {
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        },
      },
      { name: "link_url", type: "url" },
      { name: "is_active", type: "bool" },
      { name: "display_order", type: "number", options: { min: 0 } },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  })
  dao.saveCollection(ads)

  // ----- announcements -----
  const announcements = new Collection({
    name: "announcements",
    type: "base",
    schema: [
      { name: "text", type: "text", required: true },
      { name: "is_active", type: "bool" },
      { name: "priority", type: "number", options: { min: 0 } },
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  })
  dao.saveCollection(announcements)

  // ----- settings -----
  const settings = new Collection({
    name: "settings",
    type: "base",
    schema: [
      { name: "ai_api_key", type: "text" },
      { name: "ai_model", type: "text" },
      { name: "app_name", type: "text" },
    ],
    listRule: "@request.auth.role = 'admin'",
    viewRule: "@request.auth.role = 'admin'",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: null,
  })
  dao.saveCollection(settings)

}, (db) => {
  const dao = new Dao(db)
  for (const name of ["settings", "announcements", "advertisements", "rounds", "teams", "games", "questions", "categories", "users"]) {
    try { dao.deleteCollection(dao.findCollectionByNameOrId(name)) } catch (_) {}
  }
})
