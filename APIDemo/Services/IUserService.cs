using APIDemo.Models;

namespace APIDemo.Services
{
    public interface IUserService
    {
        IEnumerable<User> GetAllUsers();

        User? GetUserById(int id);
    }
}