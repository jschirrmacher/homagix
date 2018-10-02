using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.IO;
using System.Text;

namespace Homagix.Server.Controllers
{
    [Route("api/[controller]")]
    public class DataTestController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<string> Reload()
        {
            Server.Data.Data.LoadData();
            return new List<string>() { "Reloaded!" };
        }

        [HttpGet("[action]")]
        public IEnumerable<string> LoadYaml()
        {
            Server.Data.Data.LoadData(true);
            return new List<string>() { "Reloaded yaml!" };
        }


        [HttpGet("[action]")]
        public IEnumerable<string> Data()
        {
            using (FileStream f = System.IO.File.Open("test.txt", FileMode.Append))
            {
                f.Write(Encoding.UTF8.GetBytes("1"));
            }
            string text = System.IO.File.ReadAllText("test.txt");
            Log.Information(text + " in file!");
            return new List<string>() { text };
        }
    }
}