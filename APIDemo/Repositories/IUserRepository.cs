using APIDemo.Models;

namespace APIDemo.Repositories
{
    public interface IUserRepository
    {
        IEnumerable<User> GetAll();

        User? GetById(int id);
    }
}