namespace Neaproject.Models
{
    public class Client
    {
        public required string ClientID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string PhoneNum { get; set; }
        public  string? Address { get; set; }
        public  string? Postcode { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
    }
}
