﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Homagix.Shared.Data;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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

        [HttpGet("[action]/{id}")]
        public Purchase Purchase(int id)
        {
            return Data.Data.Purchases.FirstOrDefault(p => p.id == id);
        }

        [HttpPost("[action]")]
        public HttpResponseMessage UpdatePurchase([FromBody]PurchaseJson pur)
        {
            Log.Information("Getting updated purchase: " + pur.id);
            var recipes = Data.Data.Recipes.Where(r => pur.recipes.Exists(p => p == r.id)).ToList();
            Purchase purchase = new Purchase(pur.id, DateTime.Parse(pur.date), recipes, pur.ingredients);
            var temp = Data.Data.Purchases;
            var ing = Data.Data.Ingredients;
            var old = temp.First(i => i.id == purchase.id);
            old.toBuy.ForEach(r => r.ingredients.ForEach(ingr => ing.Remove(ingr)));
            temp.Remove(old);
            temp.Add(purchase);
            purchase.toBuy.ForEach(r => r.ingredients.ForEach(i => ing.Add(i)));
            Data.Data.Ingredients = ing;
            Data.Data.Purchases = temp;
            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);
        }

        [HttpPost("[action]")]
        public HttpResponseMessage DeletePurchase([FromBody]int id)
        {
            var purchases = Data.Data.Purchases;
            purchases.RemoveAll(p => p.id == id);
            Data.Data.Purchases = purchases;
            Data.Data.UpdateData();
            Log.Information($"Deleting purchase with id {id}");
            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);
        }

        [HttpGet("[action]")]
        public int CreatePurchase()
        {
            int maxPurchaseId = Data.Data.maxPurchaseId;
            Purchase purchase = new Purchase(maxPurchaseId, DateTime.Now, new List<Recipe>(), new List<Ingredient>());
            List<Purchase> purchases = Data.Data.Purchases;
            purchases.Add(purchase);
            Data.Data.Purchases = purchases;
            Data.Data.UpdateData();
            return maxPurchaseId;
        }
    }
}