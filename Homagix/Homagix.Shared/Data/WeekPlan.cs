using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Homagix.Shared.Data
{
    public class WeekPlan
    {
        public string id;
        public Recipe[] dishes = new Recipe[7];

        public bool selected = false;

        public WeekPlan()
        {

        }

        public WeekPlanJson JsonObject
        {
            get
            {
                return new WeekPlanJson(id, dishes.ToList().Select(r => r?.id).ToArray());
            }
        }

        public WeekPlan(string ID, Recipe[] dishes)
        {
            if (dishes.Length != 7)
            {
                Recipe[] _dishes = new Recipe[7];
                Array.Copy(dishes, _dishes, Math.Min(dishes.Length, 7));
                dishes = _dishes;
            }
            for (int i = 0; i < dishes.Length; i++)
            {
                if(dishes[i] is null) continue;
                dishes[i].weekPlans.Add(ID);
            }

            id = ID;
            this.dishes = dishes;
        }

        public string MealOverview
        {
            get
            {
                string preview = "";
                dishes.ToList().ForEach(i => preview += i is null ? "" : "  - " + i.name);
                try
                {
                    preview = preview.Substring(0, 120) + "...";
                }
                catch (Exception)
                {
                }
                return preview;
            }
        }
    }

    public struct WeekPlanJson
    {
        public string id;
        public int?[] dishes;

        public WeekPlanJson(string id, int?[] dishes)
        {
            this.id = id;
            this.dishes = dishes;
        }
    }
}
