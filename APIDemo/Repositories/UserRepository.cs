using APIDemo.Models;

namespace APIDemo.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly List<User> _users = new()
        {
            new User
            {
                Id = 1,
                Username = "admin",
                Password = "123456",
                Email = "admin@gmail.com"
            },

            new User
            {
                Id = 2,
                Username = "khanh",
                Password = "123456",
                Email = "khanh@gmail.com"
            }
        };

        public IEnumerable<User> GetAll()
        {
            return _users;
        }

        public User? GetById(int id)
        {
            return _users.FirstOrDefault(x => x.Id == id);
        }
    }
}