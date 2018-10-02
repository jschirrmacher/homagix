using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Homagix.Shared.Data
{
    public class Purchase
    {
        public int id;
        public DateTime time;
        public List<Recipe> toBuy;
        public List<Ingredient> individualItems;
        public bool selected = false;

        public List<Ingredient> All
        {
            get
            {
                List<Ingredient> all = new List<Ingredient>();
                toBuy.ForEach(r => all.AddRange(r.ingredients));
                all.AddRange(individualItems);
                all = Ingredient.Simplify(all);
                return all;
            }
        }

        public Purchase()
        {
        }

        public Purchase(int id, DateTime time, List<Recipe> toBuy, List<Ingredient> individualItems)
        {
            this.id = id;
            this.time = time;
            this.toBuy = toBuy;
            this.individualItems = individualItems;
        }

        public PurchaseJson PurchaseJson
        {
            get
            {
                return new PurchaseJson(id, time.ToString("yyyy/MM/dd"), toBuy.Select(r => r.id).ToList(), individualItems);
            }
        }
    }

    public struct PurchaseJson
    {
        public int id;
        public string date;
        public List<int> recipes;
        public List<Ingredient> ingredients;

        public PurchaseJson(int id, string date, List<int> recipes, List<Ingredient> ingredients)
        {
            this.id = id;
            this.date = date;
            this.recipes = recipes;
            this.ingredients = ingredients;
        }
    }
}
