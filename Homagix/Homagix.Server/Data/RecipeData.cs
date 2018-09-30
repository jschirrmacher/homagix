using Homagix.Shared.Data;
using Serilog;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using YamlDotNet.RepresentationModel;

namespace Homagix.Server.Data
{
    //This class loads the yaml and keeps in storage
    public class Data
    {
        private static List<Recipe> recipes;
        static List<WeekPlan> weeks;
        static List<Ingredient> ingredients;

        public static List<Recipe> Recipes
        {
            get
            {
                if(recipes is null)
                {
                    UpdateData();
                }
                return recipes;
            }
        }

        public static List<WeekPlan> Weeks
        {
            get
            {
                if (weeks is null)
                    UpdateData();
                return weeks;
            }
        }

        public static List<Ingredient> Ingredients
        {
            get
            {
                if (ingredients is null)
                    UpdateData();
                return ingredients;
            }
        }

        private static void UpdateData()
        {
            // Setup the input
            var input = new StringReader(File.ReadAllText("Data/speisen.yaml"));

            // Load the stream
            var yaml = new YamlStream();
            yaml.Load(input);

            // Examine the stream
            var mapping = (YamlMappingNode)yaml.Documents[0].RootNode;

            foreach (var entry in mapping.Children)
            {
                Log.Information(((YamlScalarNode)entry.Key).Value);
            }

            // List all the dishes
            recipes = new List<Recipe>();
            var items = (YamlSequenceNode)mapping.Children[new YamlScalarNode("dishes")];
            foreach (YamlMappingNode item in items)
            {
                //We are now looking at a dish
                if (!int.TryParse(item.Children[new YamlScalarNode("id")].ToString(), out int id))
                {
                    throw new Exception("Invalid id in dish!");
                }
                string name = item.Children[new YamlScalarNode("name")].ToString();
                string source = null;
                try
                {
                    source = item.Children[new YamlScalarNode("source")].ToString();
                }
                catch (KeyNotFoundException)
                {
                }
                //Iterate over indgredients
                List<Ingredient> ingredients = new List<Ingredient>();
                foreach (var ingredient in (YamlSequenceNode)item.Children[new YamlScalarNode("ingredients")])
                {
                    List<string> x = ingredient.ToString().Split(" ").ToList();
                    ingredients.Add(new Ingredient(ref x));
                }
                recipes.Add(new Recipe(id, source, name, ingredients));
            }

            // List all the weeks
            weeks = new List<WeekPlan>();
            var rawWeeks = (YamlMappingNode)mapping.Children[new YamlScalarNode("weeks")];
            foreach (var week in rawWeeks)
            {
                string id = week.Key.ToString();
                List<Recipe> list = new List<Recipe>();
                foreach (var recipeID in (YamlSequenceNode)week.Value)
                {
                    if(!int.TryParse(recipeID.ToString(), out int rId))
                    {
                        throw new Exception("Not valid recipe id: " + recipeID.ToString());
                    }
                    Recipe recipe = recipes.Find(r => r.id == rId) ?? throw new Exception($"No recipe found with id {rId}");
                    list.Add(recipe);
                }
                weeks.Add(new WeekPlan(id, list.ToArray()));
            }

            //List all the weekly ingredients
            ingredients = new List<Ingredient>();
            items = (YamlSequenceNode)mapping.Children[new YamlScalarNode("weekly")];
            foreach (var ingredient in items)
            {
                List<string> x = ingredient.ToString().Split(" ").ToList();
                ingredients.Add(new Ingredient(ref x)
                {
                    BuyEvery = 7
                });
            }

            //Monthly ingredients
            items = (YamlSequenceNode)mapping.Children[new YamlScalarNode("monthly")];
            foreach (var ingredient in items)
            {
                List<string> x = ingredient.ToString().Split(" ").ToList();
                ingredients.Add(new Ingredient(ref x)
                {
                    BuyEvery = 31
                });
            }

            //Random ingredients
            items = (YamlSequenceNode)mapping.Children[new YamlScalarNode("sometimes")];
            foreach (var ingredient in items)
            {
                List<string> x = ingredient.ToString().Split(" ").ToList();
                ingredients.Add(new Ingredient(ref x)
                {
                    BuyEvery = 93
                });
            }

        }
    }
}
