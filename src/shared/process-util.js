export function cg() {
  console.group(...arguments)
}

export function cge() {
  console.groupEnd()
}

export function cgeg() {
  cge()
  cg(...arguments)
}

export function cl() {
  console.log(...arguments)
}