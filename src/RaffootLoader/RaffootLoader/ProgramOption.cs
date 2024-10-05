namespace RaffootLoader
{
    public enum ProgramOption
    {
        DoAll = -1,

        ChangeYear,
        DropDatabase,
        CreateDatabase,
        DownloadFlags,
        DownloadLogos,
        DownloadPhotos,
        DownloadKits,
        UpdateClubsColors,
        GenerateFifaServiceFile,

        CheckClubsWithoutLogo,

        Exit = 99
    }
}
