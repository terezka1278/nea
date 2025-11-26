namespace Neaproject.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }

        public User()
        {
            Id = "";
            Email = "";
            Password = "";
            Role = "";
        }
    }
}
