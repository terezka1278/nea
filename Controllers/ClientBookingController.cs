using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Dtos;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/client-bookings")]
    public class ClientBookingsController : ControllerBase
    {
        private readonly SqliteDataAccess _db;

        public ClientBookingsController(SqliteDataAccess db)
        {
            _db = db;
        }

        // GET /api/client-bookings/{clientId}
        [HttpGet("{clientId}")]
        public ActionResult<IEnumerable<ClientBooking>> GetAllBookings(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                return BadRequest("ClientId is required.");

            var bookings = _db.GetBookingsForClient(clientId);
            return Ok(bookings);
        }

        // GET /api/client-bookings/{clientId}/next
        [HttpGet("{clientId}/next")]
        public ActionResult<NextBooking> GetNextBooking(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                return BadRequest("ClientId is required.");

            var booking = _db.GetNextBookingForClient(clientId);

            if (booking == null || !booking.HasBooking)
                return Ok(new NextBooking { HasBooking = false });

            return Ok(booking);
        }
        // GET: /api/client-bookings/{clientId}/quotes
        [HttpGet("{clientId}/quotes")]
        public ActionResult<IEnumerable<ClientQuote>> GetQuotes(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                return BadRequest("ClientId is required.");

            var quotes = _db.GetQuotesForClient(clientId);
            return Ok(quotes);
        }

        // GET: /api/client-bookings/{clientId}/invoices
        [HttpGet("{clientId}/invoices")]
        public ActionResult<IEnumerable<ClientInvoice>> GetInvoices(string clientId)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                return BadRequest("ClientId is required.");

            var invoices = _db.GetInvoicesForClient(clientId);
            return Ok(invoices);
        }

    }
}
