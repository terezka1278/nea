using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Dtos;
using System.Collections.Generic;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/business/documents")]
    public class BusinessDocumentsController : ControllerBase
    {
        private readonly SqliteDataAccess _db;

        public BusinessDocumentsController(SqliteDataAccess db)
        {
            _db = db;
        }

        // GET /api/business/documents/quotes
        [HttpGet("quotes")]
        public ActionResult<IEnumerable<ClientQuote>> GetAllQuotes()
        {
            var quotes = _db.GetAllQuotes();
            return Ok(quotes);
        }

        // GET /api/business/documents/invoices
        [HttpGet("invoices")]
        public ActionResult<IEnumerable<ClientInvoice>> GetAllInvoices()
        {
            var invoices = _db.GetAllInvoices();
            return Ok(invoices);
        }
    }
}
