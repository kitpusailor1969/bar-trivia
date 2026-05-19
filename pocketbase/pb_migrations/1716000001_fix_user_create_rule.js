/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const users = dao.findCollectionByNameOrId("users")
  // Allow anyone to call the create endpoint; a hook enforces the actual logic
  users.createRule = ""
  dao.saveCollection(users)
}, (db) => {
  const dao = new Dao(db)
  const users = dao.findCollectionByNameOrId("users")
  users.createRule = null
  dao.saveCollection(users)
})
