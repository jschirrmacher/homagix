using Homagix.Shared.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YamlDotNet.RepresentationModel;
using YamlDotNet.Serialization;

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
                    LoadData();
                }
                return recipes;
            }
        }

        public static List<WeekPlan> Weeks
        {
            get
            {
                if (weeks is null)
                    LoadData();
                return weeks;
            }
        }

        public static List<Ingredient> Ingredients
        {
            get
            {
                if (ingredients is null)
                    LoadData();
                return ingredients;
            }
        }

        public static void SaveData()
        {
            JsonSerializer serializer = new JsonSerializer();
            using (StreamWriter streamWriter = new StreamWriter(@".\DataBase\recipe.json", false, Encoding.UTF8))
            using (JsonWriter jsonWriter = new JsonTextWriter(streamWriter))
            {
                serializer.Serialize(jsonWriter, recipes.Select(r => r.JsonObject).ToArray());
            }
            using (StreamWriter streamWriter = new StreamWriter(@".\DataBase\weeks.json", false, Encoding.UTF8))
            using (JsonWriter jsonWriter = new JsonTextWriter(streamWriter))
            {
                serializer.Serialize(jsonWriter, weeks.Select(r => r.JsonObject).ToArray());
            }
            using (StreamWriter streamWriter = new StreamWriter(@".\DataBase\ingredients.json", false, Encoding.UTF8))
            using (JsonWriter jsonWriter = new JsonTextWriter(streamWriter))
            {
                serializer.Serialize(jsonWriter, ingredients.ToArray());
            }
        }

        public static void LoadData(bool forceYaml = false)
        {
            if (!forceYaml && File.Exists(@".\DataBase\recipe.json"))
            {
                Log.Information("Loading data from datbase!");
                LoadDataFromJson();
            }
            else
            {
                Log.Information("Loading and populating database from yaml!");
                LoadDataFromYAML();
            }
        }

        private static void LoadDataFromJson()
        {
            using (FileStream fs = new FileStream(@".\DataBase\recipe.json", FileMode.Open))
            {
                using (StreamReader streamReader = new StreamReader(fs))
                {
                    recipes = new List<Recipe>();
                    string value = streamReader.ReadToEnd();
                    var data = JsonConvert.DeserializeObject(value);
                    var jData = (JArray)data;
                    foreach (JToken item in jData.Children())
                    {
                        int id = (int)item["id"];
                        string source = (string)item["source"];
                        string name = (string)item["name"];
                        var jIngredients = (JArray)item["ingredients"];
                        List<Ingredient> ingredients = new List<Ingredient>();
                        foreach (JToken ing in jIngredients)
                        {
                            ingredients.Add(Ingredient.Create(ing.Value<string>()));
                        }
                        recipes.Add(new Recipe(id, source, name, ingredients));
                        Log.Information($"Loaded Recipe: {recipes.Last().id} - {recipes.Last().name}");
                    }
                }
            }

            using (FileStream fs = new FileStream(@".\DataBase\weeks.json", FileMode.Open))
            {
                using (StreamReader streamReader = new StreamReader(fs))
                {
                    weeks = new List<WeekPlan>();
                    string value = streamReader.ReadToEnd();
                    var data = JsonConvert.DeserializeObject(value);
                    var jData = (JArray)data;
                    foreach (JToken item in jData.Children())
                    {
                        string id = (string)item["id"];
                        var jWeeks = (JArray)item["dishes"];
                        List<Recipe> recipes = new List<Recipe>();
                        foreach (JToken ing in jWeeks)
                        {
                            if (ing.ToString().Length != 0)
                            {
                                int v = ing.Value<int>();
                                recipes.Add(Data.recipes.First(r => r.id == v));
                            }
                        }
                        weeks.Add(new WeekPlan(id, recipes.ToArray()));
                        Log.Information($"Loaded Weekplan: {weeks.Last().id}");
                    }
                }
            }

            using (FileStream fs = new FileStream(@".\DataBase\ingredients.json", FileMode.Open))
            {
                using (StreamReader streamReader = new StreamReader(fs))
                {
                    ingredients = new List<Ingredient>();
                    string value = streamReader.ReadToEnd();
                    var data = JsonConvert.DeserializeObject(value);
                    var jData = (JArray)data;
                    foreach (JToken item in jData.Children())
                    {
                        string name = (string)item["name"];
                        int buyEvery = (int)item["BuyEvery"];
                        var jWeeks = (JArray)item["dishes"];
                        JToken jAmount = item["amount"];
                        Amount amount = null;
                        try
                        {
                            double amountValue = (double)jAmount["value"];
                            string amountId = (string)jAmount["id"];
                            amount = new Amount(amountValue, amountId);
                        }
                        catch (Exception)
                        {
                        }
                        Ingredient ingredient = new Ingredient(name, amount)
                        {
                            BuyEvery = buyEvery
                        };
                        ingredients.Add(ingredient);
                        Log.Information($"Loaded Ingredient: {ingredient}");
                    }
                }
            }
        }

        private static void LoadDataFromYAML()
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
                ingredients.Add(new Ingredient(ingredient.ToString(), null)
                {
                    BuyEvery = 93
                });
            }
            SaveData();
        }
    }
}
