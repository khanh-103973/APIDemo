using APIDemo.Data;
using APIDemo.Exceptions;
using APIDemo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HousesController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/houses
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] decimal? minPrice)
        {
            var query = _context.Houses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(h => h.Status.ToLower() == status.ToLower());
            }

            if (minPrice.HasValue)
            {
                query = query.Where(h => h.Price >= minPrice.Value);
            }

            var houses = await query.ToListAsync();
            return Ok(houses);
        }

        // GET /api/houses/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var house = await _context.Houses.FindAsync(id)
                ?? throw new NotFoundException($"Khong tim thay nha cho thue Id = {id}");

            return Ok(house);
        }

        // POST /api/houses
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] House house)
        {
            if (house is null)
            {
                throw new BadRequestException("Du lieu khong hop le.");
            }

            house.Id = 0;
            house.Status = string.IsNullOrWhiteSpace(house.Status) ? "Available" : house.Status;

            _context.Houses.Add(house);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = house.Id },
                house);
        }

        // PUT /api/houses/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] House updated)
        {
            var house = await _context.Houses.FindAsync(id)
                ?? throw new NotFoundException($"Khong tim thay nha cho thue Id = {id}");

            house.Title = updated.Title;
            house.Description = updated.Description;
            house.Address = updated.Address;
            house.Price = updated.Price;
            house.Area = updated.Area;
            house.Bedrooms = updated.Bedrooms;
            house.ImageUrl = updated.ImageUrl;
            house.Status = updated.Status;
            house.OwnerId = updated.OwnerId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/houses/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var house = await _context.Houses.FindAsync(id)
                ?? throw new NotFoundException($"Khong tim thay nha cho thue Id = {id}");

            _context.Houses.Remove(house);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
