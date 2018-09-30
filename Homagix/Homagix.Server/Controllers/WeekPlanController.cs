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
    public class WeekPlanController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<WeekPlan> WeekPlan()
        {
            Log.Information("/WeekPlan called");
            return Data.Data.Weeks;
        }
    }
}