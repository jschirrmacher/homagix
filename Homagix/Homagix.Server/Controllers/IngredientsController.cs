using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Homagix.Shared.Data;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Homagix.Server.Controllers
{
    [Route("api/[controller]")]
    public class IngredientsController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<Ingredient> Ingredients()
        {
            Log.Information("/Ingredients called");
            return Data.Data.Ingredients;
        }

        [HttpGet("[action]")]
        public IEnumerable<IngredientOverview> BoughtIngredientsOverview()
        {
            Log.Information("/BoughtIngredientsOverview called");
            return Ingredient.SortByName(Data.Data.Ingredients);
        }
    }
}