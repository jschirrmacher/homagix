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
            Log.Information("/Recipe called");
            return Data.Data.Ingredients;
        }
    }
}