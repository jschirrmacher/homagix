import { Dish } from '../app-types'

export const ingredients = {
  mehl: { id: '7', unit: 'g', name: 'Mehl', group: 'tinned' },
  hefe: { id: '9', unit: 'Würfel', name: 'Hefe', group: 'cooled' },
  eier: { id: '4', unit: 'Stk', name: 'Eier', group: 'cooled' },
}

export const dishes: Record<string, Dish> = {
  brot: {
    id: '4',
    name: 'Brot',
    items: [
      { id: ingredients.mehl.id, amount: 500 },
      { id: ingredients.hefe.id, amount: 1 },
    ],
    last: '2021-01-25',
  },
  kuchen: {
    id: '5',
    name: 'Kuchen',
    items: [
      { id: ingredients.mehl.id, amount: 350 },
      { id: ingredients.hefe.id, amount: 0.5 },
      { id: ingredients.eier.id, amount: 3 },
    ],
    last: '2021-01-24',
  },
  pizza: {
    id: '6',
    name: 'Pizza',
    items: [
      { id: ingredients.mehl.id, amount: 350 },
      { id: ingredients.hefe.id, amount: 0.5 },
    ],
  },
}
