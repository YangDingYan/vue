export function cg() {
  console.group(...arguments)
}

export function cge() {
  console.groupEnd(...arguments)
}

export function cgeg() {
  cge(...arguments)
  cg(...arguments)
}

export function cl() {
  console.log(...arguments)
}