import crypto from "crypto"

export function generateToken() {
  return crypto.randomBytes(64).toString("hex")
}