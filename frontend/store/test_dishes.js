export const ingredients = {
  mehl: { id: 7, unit: 'g', name: 'Mehl', group: 'tinned' },
  hefe: { id: 9, unit: 'Würfel', name: 'Hefe', group: 'cooled' },
  eier: { id: 4, unit: 'Stk', name: 'Eier', group: 'cooled' },
}

export const dishes = {
  brot: { id: 4, items: [
    { id: ingredients.mehl.id, amount: 500 },
    { id: ingredients.hefe.id, amount: 1 },
  ]},
  kuchen: { id: 5, items: [
    { id: ingredients.mehl.id, amount: 350 },
    { id: ingredients.hefe.id, amount: .5 },
    { id: ingredients.eier.id, amount: 3 },
  ]}
}
