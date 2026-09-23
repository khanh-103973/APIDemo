using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousesController : ControllerBase
    {
        private static readonly List<House> _houses = new()
        {
            new House
            {
                Id = 1,
                Title = "Can ho mini gan truong dai hoc",
                Description = "Phong day du noi that, co bep nho va nha ve sinh rieng.",
                Address = "Quan 1, TP. Ho Chi Minh",
                Price = 4500000,
                Area = 28,
                Bedrooms = 1,
                ImageUrl = "https://example.com/house-1.jpg",
                Status = "Available",
                OwnerId = 1
            },
            new House
            {
                Id = 2,
                Title = "Nha nguyen can 2 phong ngu",
                Description = "Khu dan cu yen tinh, phu hop gia dinh nho.",
                Address = "Quan Binh Thanh, TP. Ho Chi Minh",
                Price = 9000000,
                Area = 65,
                Bedrooms = 2,
                ImageUrl = "https://example.com/house-2.jpg",
                Status = "Rented",
                OwnerId = 2
            },
            new House
            {
                Id = 3,
                Title = "Phong tro co gac lung",
                Description = "Phong sach se, co cho de xe va gio giac tu do.",
                Address = "Quan Go Vap, TP. Ho Chi Minh",
                Price = 3200000,
                Area = 22,
                Bedrooms = 1,
                ImageUrl = "https://example.com/house-3.jpg",
                Status = "Available",
                OwnerId = 1
            }
        };

        // GET /api/houses
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? status, [FromQuery] decimal? minPrice)
        {
            var houses = _houses.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                houses = houses.Where(h => h.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
            }

            if (minPrice.HasValue)
            {
                houses = houses.Where(h => h.Price >= minPrice.Value);
            }

            return Ok(houses);
        }

        // GET /api/houses/1
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var house = _houses.FirstOrDefault(h => h.Id == id);

            if (house is null)
            {
                return NotFound(new { message = $"Khong tim thay nha cho thue Id = {id}" });
            }

            return Ok(house);
        }

        // POST /api/houses
        [HttpPost]
        public IActionResult Create([FromBody] House house)
        {
            if (house is null)
            {
                return BadRequest(new { message = "Du lieu khong hop le." });
            }

            house.Id = _houses.Any()
                ? _houses.Max(h => h.Id) + 1
                : 1;

            house.Status = string.IsNullOrWhiteSpace(house.Status)
                ? "Available"
                : house.Status;

            _houses.Add(house);

            return CreatedAtAction(
                nameof(GetById),
                new { id = house.Id },
                house);
        }

        // PUT /api/houses/1
        [HttpPut("{id:int}")]
        public IActionResult Update(int id, [FromBody] House updated)
        {
            var house = _houses.FirstOrDefault(h => h.Id == id);

            if (house is null)
            {
                return NotFound(new { message = $"Khong tim thay nha cho thue Id = {id}" });
            }

            house.Title = updated.Title;
            house.Description = updated.Description;
            house.Address = updated.Address;
            house.Price = updated.Price;
            house.Area = updated.Area;
            house.Bedrooms = updated.Bedrooms;
            house.ImageUrl = updated.ImageUrl;
            house.Status = updated.Status;
            house.OwnerId = updated.OwnerId;

            return NoContent();
        }

        // DELETE /api/houses/1
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            var house = _houses.FirstOrDefault(h => h.Id == id);

            if (house is null)
            {
                return NotFound(new { message = $"Khong tim thay nha cho thue Id = {id}" });
            }

            _houses.Remove(house);

            return NoContent();
        }
    }
}
