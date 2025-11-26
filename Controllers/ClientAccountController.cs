using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Models;
using Neaproject.Dtos;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/client-account")]
    public class ClientAccountController : ControllerBase
    {
        private readonly SqliteDataAccess _db;

        public ClientAccountController(SqliteDataAccess db)
        {
            _db = db;
        }

        // GET client info
        [HttpGet("{clientId}")]
        public ActionResult<Client> GetClient(string clientId)
        {
            var client = _db.GetClientById(clientId);

            if (client == null)
                return NotFound("Client not found");

            return Ok(client);
        }

        // UPDATE client fields
        // UPDATE client fields
        [HttpPut("{clientId}")]
        public IActionResult UpdateClient(string clientId, [FromBody] ClientUpdate updated)
        {
            _db.UpdateClientFields(
                clientId,
                updated.Email,
                updated.PhoneNum,
                updated.Address,
                updated.Postcode,
                updated.Password
            );

            return Ok(new { message = "Account updated successfully." });
        }

    }
}
