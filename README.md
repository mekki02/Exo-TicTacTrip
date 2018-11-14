NB: Application déployé sur la plateforme heroku

URL : https://url-exo-tictactrip.herokuapp.com

Outil utilisé: Postman

Liste des emails des utilisateurs pour recevoir un token : 'foo@bar.com', 'test@bar.com', 'exemple@bar.com'.

Pour avoir un token il faut passer une requète sur la route /api/token ayant un body de content-type JSON.
Par exemple: 
{
    email:'foo@bar.com'
}
Si on passe un email qui n'est pas dans la liste spécifié on reçoit une réponse de type JSON ayant dans son contenu { message: "Utilisateur Non Trouvé"}

Après avoir passer la requète avec le bon email, vous recevrez une réponse de type JSON ayant dans son contenu le token.
{
    token:"encodedToken"
}

Ce token est ensuite utilisé pour faire une requète de type text/plain sur la route /api/justify ou le body contient le texte à justifié et on passe le token dans authorization de type Token Bearer dans Postman.
Si on passe pas le token on reçoit une réponse JSON { message: "Unauthorized" }.
Si on passe un token non valid on reçoit une réponse JSON { message: "Unauthorized: Invalid Token" }.
Si le token est valide on reçoit une réponse de type text/plain contenant le texte justifié, et on icrémente les mots justifié de ce token qui sont limité à 80000 mots par jour.

Chaque jour à minuit, les compteurs des mots justifié par utilisateur sont remis à zero.
