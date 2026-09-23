using APIDemo.Models;
using APIDemo.Repositories;

namespace APIDemo.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public IEnumerable<User> GetAllUsers()
        {
            return _userRepository.GetAll();
        }

        public User? GetUserById(int id)
        {
            return _userRepository.GetById(id);
        }
    }
}