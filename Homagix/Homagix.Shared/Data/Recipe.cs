using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Homagix.Shared.Data
{
    public class Recipe
    {
        public int id;
        public string source;
        public string name;
        public List<Ingredient> ingredients;
        public bool selected = false;
        public List<string> weekPlans = new List<string>(); //One can only store the id here otherwise we have a circular reference which crashes the json sending to client

        public Recipe(int id, string source, string name, List<Ingredient> ingredients)
        {
            this.id = id;
            this.source = source;
            this.name = name;
            this.ingredients = ingredients;
        }

        public Recipe()
        {

        }

        public RecipeJson JsonObject
        {
            get
            {
                return new RecipeJson(id, source, name, ingredients.Select(i => i.ToString()).ToArray());
            }
        }

        public string IngredientsList
        {
            get
            {
                string preview = "";
                ingredients.ForEach(i => preview += "<br> " + i.ToString() + "</br>");
                return preview;
            }
        }

        public string IngredientsPreview
        {
            get
            {
                string preview = "";
                ingredients.ForEach(i => preview += " " + i.ToString());
                try
                {
                    preview = preview.Substring(0, 40) + "...";
                }
                catch (Exception)
                {
                }
                return preview;
            }
        }
    }

    public struct RecipeJson
    {
        public int id;
        public string source;
        public string name;
        public string[] ingredients;

        public RecipeJson(int id, string source, string name, string[] ingredients)
        {
            this.id = id;
            this.source = source;
            this.name = name;
            this.ingredients = ingredients;
        }
    }
}
