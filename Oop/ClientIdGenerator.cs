namespace Neaproject.Oop
{
    public static class ClientIdGenerator
    {
        public static string CreateClientId(string firstName, string lastName, string phoneNum) //create a method to generate a clientID
        {
            string f = firstName.Substring(0, 1).ToUpper();  //first letter of first name in upper case
            string l = lastName.Substring(0, 1).ToUpper(); //first letter of last name in upper case
            string last3 = phoneNum.Substring(phoneNum.Length - 3); //last 3 numbers of phone number

            return f + l + last3; //return  generated clientID of first letter in first name, first letter in last name and last 3 numbers of phone number
        }
    }
}
