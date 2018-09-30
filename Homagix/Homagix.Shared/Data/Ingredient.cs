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

        public Ingredient()
        {

        }

        public Ingredient(string name, Amount amount)
        {
            this.name = name;
            this.amount = amount;
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
            return $"{amount.ToString() ?? ""} {name}";
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
            "Topf"
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
