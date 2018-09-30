using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Homagix.Server.Data;
using Homagix.Shared.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Homagix.Server.Controllers
{
    [Route("api/[controller]")]
    public class RecipeController : ControllerBase
    {
        [HttpGet("[action]")]
        public IEnumerable<Recipe> Recipe()
        {
            Log.Information("/Recipe called");
            return Data.Data.Recipes;
        }
    }
}