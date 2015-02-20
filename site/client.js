$(document).ready( function() {
    $("#data").load( "api/query/hkdata" );
    $(":radio[name=stations]").on( "change", function() {
        alert( $(this).val() );
    });
});