using APIDemo.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetProducts()
        {
            return Ok(new[]
            {
                new
                {
                    Id = 1,
                    Name = "Laptop",
                    Price = 20000000
                },

                new
                {
                    Id = 2,
                    Name = "Mouse",
                    Price = 500000
                }
            });
        }

        [HttpPost]
        public IActionResult Create(ProductDto product)
        {
            return Ok(product);
        }
    }
}