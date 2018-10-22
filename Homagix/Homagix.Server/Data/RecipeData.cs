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
using YamlDotNet.Core;
using YamlDotNet.RepresentationModel;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.Converters;

namespace Homagix.Server.Data
{
    //This class loads the yaml and keeps in storage
    public class Data
    {
        private static List<Recipe> recipes;
        static List<WeekPlan> weeks;
        static List<Ingredient> ingredients;
        static List<Purchase> purchases;
        public static int maxPurchaseId = 0;

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
            set
            {
                ingredients = value;
                UpdateData();
            }
        }

        public static List<Purchase> Purchases
        {
            get
            {
                if (purchases is null)
                    LoadData();
                return purchases;
            }
            set
            {
                purchases = value;
                UpdateData();
            }
        }

        public static void UpdateData()
        {
            maxPurchaseId = purchases.Max(p => p.id) + 1;
            SaveData();
        }

        private static void SaveData()
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
            using (StreamWriter streamWriter = new StreamWriter(@".\DataBase\purchases.json", false, Encoding.UTF8))
            using (JsonWriter jsonWriter = new JsonTextWriter(streamWriter))
            {
                serializer.Serialize(jsonWriter, purchases.Select(p => p.PurchaseJson).ToArray());
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
            maxPurchaseId = purchases.Max(p => p.id) + 1;
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
                        int? buyEvery = (int?)item["BuyEvery"];
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

            using (FileStream fs = new FileStream(@".\DataBase\purchases.json", FileMode.Open))
            {
                using (StreamReader streamReader = new StreamReader(fs))
                {
                    purchases = new List<Purchase>();
                    string value = streamReader.ReadToEnd();
                    var data = JsonConvert.DeserializeObject(value);
                    var jData = (JArray)data;
                    foreach (JToken item in jData.Children())
                    {
                        int id = (int)item["id"];
                        DateTime date = (DateTime)item["date"];
                        var jRecipes = (JArray)item["recipes"];
                        List<Recipe> pRecipes = new List<Recipe>();
                        foreach (JToken jRecipe in jRecipes)
                        {
                            int v1 = jRecipe.Value<int>();
                            Log.Information($"When loading purchase, finding recipe with id {id}");
                            //TODO: Ensure that they are actually loaded
                            pRecipes.Add(recipes.Find(r => r.id == v1));
                        }
                        var jIngredients = (JArray)item["ingredients"];
                        List<Ingredient> rIngredients = new List<Ingredient>();
                        foreach (JToken jIngredient in jIngredients)
                        {
                            List<JProperty> list = jIngredient.Children<JProperty>().ToList();
                            string name = list.Find(t => t.Name == "name").Value.Value<string>();
                            JObject jAmount = (JObject)list.Find(t => t.Name == "amount").Value;
                            double aValue = jAmount["value"].Value<double>();
                            string aId = jAmount["id"].Value<string>();
                            Amount amount = new Amount(aValue, aId);
                            rIngredients.Add(new Ingredient(name, amount) { dateBought = date });
                        }
                        //TODO: Somehow figure out which ingredient goes to which recipe
                        ingredients.AddRange(rIngredients);
                        purchases.Add(new Purchase(id, date, pRecipes, rIngredients));
                        Log.Information($"Loaded Purchase: {id} - {date.ToString("yyyy/MM/dd")} - {recipes.Count} recipes and {rIngredients.Count} items");
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
                    Recipe recipe = recipes.FirstOrDefault(r => r.id == rId) ?? throw new Exception($"No recipe found with id {rId}");
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

            //Load all the purchases
            purchases = new List<Purchase>();
            items = (YamlSequenceNode)mapping.Children[new YamlScalarNode("purchases")];
            foreach (YamlMappingNode purchase in items)
            {
                int id = int.Parse(purchase[new YamlScalarNode("id")].ToString());
                DateTime date = DateTime.Parse(purchase[new YamlScalarNode("date")].ToString());

                //Recipes
                List<Recipe> recipes = new List<Recipe>();
                var yRecipes = (YamlSequenceNode)purchase[new YamlScalarNode("recipes")];
                foreach (var recipeID in yRecipes)
                {
                    if (!int.TryParse(recipeID.ToString(), out int rId))
                    {
                        throw new Exception("Not valid recipe id: " + recipeID.ToString());
                    }
                    Recipe recipe = recipes.FirstOrDefault(r => r.id == rId) ?? throw new Exception($"No recipe found with id {rId}");
                    recipes.Add(recipe);
                    var rIngredients = recipe.ingredients.Select(r => r.Clone());
                    foreach (var ing in rIngredients)
                    {
                        ing.dateBought = date;
                        ing.recipeID = recipe.id;
                    }
                    ingredients.AddRange(rIngredients);
                }

                //Add Ingredients
                List<Ingredient> sIngredients = new List<Ingredient>();
                foreach (var ingredient in (YamlSequenceNode)purchase.Children[new YamlScalarNode("ingredients")])
                {
                    List<string> x = ingredient.ToString().Split(" ").ToList();
                    sIngredients.Add(new Ingredient(ref x) { dateBought = date });
                }
                purchases.Add(new Purchase(id, date, recipes, sIngredients));
                ingredients.AddRange(sIngredients);
                Log.Information($"YAML: Loaded Purchase: {id} - {date.ToString("yyyy/MM/dd")} - {recipes.Count} recipes and {sIngredients.Count} items");
            }

            UpdateData();
        }
    }
}
