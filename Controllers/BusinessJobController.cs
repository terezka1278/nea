using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Dtos;
using Neaproject.Models;
using System.Collections.Generic;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/business/jobs")]
    public class BusinessJobsController : ControllerBase
    {
        private readonly SqliteDataAccess _db;

        public BusinessJobsController(SqliteDataAccess db)
        {
            _db = db;
        }



        // GET /api/business/jobs
        [HttpGet]
        public ActionResult<IEnumerable<Job>> GetAll()
        {
            var jobs = _db.GetAllJobs();
            return Ok(jobs);
        }

        // PUT /api/business/jobs/{jobId}/complete
        [HttpPut("{jobId}/complete")]
        public IActionResult MarkCompleted(string jobId)
        {
            _db.MarkJobCompleted(jobId);
            return NoContent();

        }
        
    

    }
}
