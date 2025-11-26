using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Dtos;
using Neaproject.Models;
using Neaproject.Oop;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/client")]    
    public class ClientController : ControllerBase
    {
        private readonly SqliteDataAccess _db;
        public ClientController(SqliteDataAccess db)
        {
            _db = db;
        }

        // create account
        // create account
        [HttpPost("create-account")]
        public IActionResult CreateAccount([FromBody] ClientCreateRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "No data sent." });

            // basic required-field validation (add more if you like)
            if (string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.PhoneNum) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Please fill in all required fields." });
            }

            var email = request.Email.Trim();
            var phone = request.PhoneNum.Trim();

            // 1. Email must be unique
            if (_db.EmailExists(email))
            {
                return BadRequest(new { message = "Email already in use." });
            }

            // 2. Phone number must be unique
            if (_db.PhoneExists(phone))
            {
                return BadRequest(new { message = "Phone number already in use." });
            }

            // 3. Generate client ID
            string id = ClientIdGenerator.CreateClientId(
                request.FirstName,
                request.LastName,
                request.PhoneNum
            );

            // 4. Build client model
            var client = new Client
            {
                ClientID = id,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = email,
                PhoneNum = phone,
                Address = request.Address?.Trim(),
                Postcode = request.Postcode?.Trim(),
                Password = request.Password, // later: hash this
                Role = "C"
            };

            try
            {
                // 5. Save to DB
                _db.CreateClient(client);
            }
            catch (Exception ex)
            {
                // fallback in case DB still throws (e.g. race condition)
                return BadRequest(new { message = ex.Message });
            }

            // 6. Return success
            return Ok(new
            {
                message = "Account created",
                clientId = id
            });
        }



        // login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // validation needed
  
            var user = _db.GetUserByEmail(request.Email.Trim());
            if (user == null)
            {
                return BadRequest(new { message = "Account not found." });
            }
            if (user.Password != request.Password) // hashing
            {
                return BadRequest(new { message = "Incorrect password." });
            }
            
            return Ok(new
            {
                message = "Login Successful",
                clientId = user.Id,
                role = user.Role
            });
        }
    }
}
