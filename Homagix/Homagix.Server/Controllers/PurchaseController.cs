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
    public class PurchasesController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<Purchase> Purchases()
        {
            Log.Information("/Purchases called");
            return Data.Data.Purchases;
        }
    }
}