using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Homagix.Shared.Data
{ 
    public class Ingredient
    {
        public string name;
        public Amount amount;
        public int? BuyEvery = null;
        public DateTime? dateBought = null;
        public int recipeID;

        public Ingredient()
        {

        }

        public Ingredient(string name, Amount amount)
        {
            this.name = name;
            this.amount = amount;
        }

        public static Ingredient Create(string line)
        {
            List<string> words = line.Split(' ').ToList();
            return new Ingredient(ref words);
        }

        public Ingredient(ref List<string> words)
        {
            amount = Amount.ConsumeAmount(ref words);
            if (words.Count == 0)
                throw new Exception("There is no name for the ingredient!");
            name = string.Join(" ", words);
            words.Clear();
        }

        public override string ToString()
        {
            return $"{amount?.ToString() ?? ""} {name}";
        }

        public Ingredient Clone()
        {
            return new Ingredient(name, new Amount(amount.value, amount.id));
        }

        public static List<Ingredient> Simplify(List<Ingredient> ingredients)
        {
            //TODO: Add support for combiningg items of different amounts
            List<Ingredient> simplified = new List<Ingredient>();
            foreach (var ing in ingredients)
            {
                Ingredient same = simplified.FirstOrDefault(i => ing.name == i.name && i.amount.id == ing.amount.id);
                if (same != null)
                {
                    //Combine
                    same.amount.value += ing.amount.value;
                }
                else
                {
                    //add new
                    simplified.Add(ing.Clone());
                }
            }

            return simplified;
        }

        public static List<IngredientOverview> SortByName(List<Ingredient> ingredients)
        {
            List<IngredientOverview> overview = new List<IngredientOverview>();
            foreach (var ingredient in ingredients)
            {
                if (ingredient.dateBought is null)
                    continue;
                var item = overview.FirstOrDefault(i => i.name == ingredient.name);
                if (item != null)
                {
                    item.dates.Add(ingredient.dateBought ?? throw new Exception("Can not handle items without by date!"));
                    item.amounts.Add(ingredient.amount);
                }
                else
                {
                    overview.Add(new IngredientOverview(ingredient.name, new List<Amount> { ingredient.amount }, 
                        new List<DateTime> { ingredient.dateBought ?? throw new Exception("Can not hanfle itesm without date!") }));
                }
            }
            return overview;
        }
    }

    public class IngredientOverview
    {
        public string name;
        public List<Amount> amounts;
        public List<DateTime> dates;
        public bool selected = false;

        public IngredientOverview()
        {

        }

        public IngredientOverview(string name, List<Amount> amounts, List<DateTime> dates)
        {
            this.name = name;
            this.amounts = amounts;
            this.dates = dates;
        }
    }

    public class Amount
    {
        public static List<string> IDs = new List<string>
        {
            "kg",
            "Glas",
            "g",
            "Stk.",
            "Zehen",
            "L",
            "Bund",
            "Pkg.",
            "Kopf",
            "Topf",
            "Würfel",
            "Packung",
            "Tafel",
            "Stück",
            "Flasche",
            "Sack",
            "Netz"
        };

        public double value;
        public string id;

        public Amount()
        {

        }

        public Amount(double value, string id)
        {
            this.value = value;
            this.id = id;
        }

        public static Amount ConsumeAmount(ref List<string> words)
        {
            if(!double.TryParse(words[0], out double value))
            {
                throw new Exception($"{words[0]} is not a valid amount!");
            }
            words.RemoveAt(0);
            string id = words[0];
            if(!IDs.Exists(x => x == id))
            {
                throw new Exception($"{id} is not a valid ID!");
            }
            words.RemoveAt(0);
            return new Amount(value, id);
        }

        public override string ToString()
        {
            return $"{value} {id}";
        }
    }
}
