namespace Neaproject.Oop
{
    public static class ClientIdGenerator
    {
        public static string CreateClientId(string firstName, string lastName, string phoneNum)
        {
           

            string f = firstName.Substring(0, 1).ToUpper();
            string l = lastName.Substring(0, 1).ToUpper();
            string last3 = phoneNum.Substring(phoneNum.Length - 3);

            return f + l + last3;
        }
    }
}
